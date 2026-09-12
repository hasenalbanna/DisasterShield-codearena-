import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('DisasterShield smoke test renders navigation shell', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DisasterShieldApp()));

    expect(find.text('Live Hazard Radar'), findsOneWidget);
    expect(find.text('Map'), findsOneWidget);
    expect(find.text('Report'), findsOneWidget);
    expect(find.text('SOS'), findsOneWidget);
  });
}
